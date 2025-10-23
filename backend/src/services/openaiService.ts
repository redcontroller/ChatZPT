import OpenAI from 'openai';
import { Character } from '../types/character';
import { Conversation, Message } from '../types/chat';
import config from '../config';

class OpenAIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });
  }

  // 환경에 따른 모델 선택
  private getModelForEnvironment(): string {
    // 환경변수로 명시적으로 설정된 경우 우선 사용
    if (config.OPENAI_MODEL) {
      return config.OPENAI_MODEL;
    }
    
    // 환경에 따른 기본 모델 선택
    const isProduction = process.env.NODE_ENV === 'production';
    return isProduction ? 'gpt-4o-mini-search-preview' : 'gpt-3.5-turbo-16k';
  }

  async sendMessage(
    message: string, 
    character: Character, 
    conversation: Conversation, 
    messages: Message[]
  ): Promise<string> {
    try {
      // 개발 환경에서 Mock 응답 사용 (API 할당량 초과 시)
      if (process.env.USE_MOCK_RESPONSE === 'true' || !config.OPENAI_API_KEY) {
        return this.getMockResponse(character, message);
      }

      // 대화 컨텍스트 최적화 (비용 절감을 위한 Context Window 관리)
      const optimizedMessages = this.optimizeConversationContext(messages);
      const conversationContext = this.formatConversationContext(optimizedMessages);

      // 시스템 프롬프트 생성
      const systemPrompt = this.createSystemPrompt(character, conversationContext);

      // OpenAI API 호출 (환경에 따른 모델 선택 및 비용 절감을 위한 토큰 제한)
      const selectedModel = this.getModelForEnvironment();
      console.log(`Using OpenAI model: ${selectedModel} (Environment: ${process.env.NODE_ENV || 'development'})`);
      
      const completion = await this.openai.chat.completions.create({
        model: selectedModel,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: config.OPENAI_MAX_TOKENS || 1500, // 응답 길이 제한 (비용 절감)
        temperature: config.OPENAI_TEMPERATURE || 0.7,
        top_p: config.OPENAI_TOP_P || 0.9,
        frequency_penalty: config.OPENAI_FREQUENCY_PENALTY || 0.1,
        presence_penalty: config.OPENAI_PRESENCE_PENALTY || 0.1,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // 응답 후처리
      return this.postProcessResponse(response);
    } catch (error) {
      console.error('Error in OpenAI API call:', error);
      
      if (error instanceof Error && error.message.includes('rate limit')) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      
      if (error instanceof Error && error.message.includes('quota')) {
        console.log('API quota exceeded. Using mock response for development.');
        return this.getMockResponse(character, message);
      }
      
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  private createSystemPrompt(character: Character, conversationContext: string): string {
    return `${character.systemPrompt}

현재 대화 컨텍스트:
${conversationContext}

위 컨텍스트를 바탕으로 사용자의 메시지에 응답해주세요. 응답은 200자 이내로 간결하게 작성해주세요.`;
  }

  private optimizeConversationContext(messages: Message[]): Message[] {
    // 비용 절감을 위한 Context Window 최적화
    const MAX_CONTEXT_MESSAGES = config.OPENAI_MAX_CONTEXT_MESSAGES || 8; // 최대 8개 메시지만 유지 (비용 절감)
    const MAX_MESSAGE_LENGTH = config.OPENAI_MAX_MESSAGE_LENGTH || 500; // 메시지당 최대 길이 제한
    
    // 최근 메시지들만 선택
    const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);
    
    // 메시지 길이 제한 및 요약
    return recentMessages.map(msg => ({
      ...msg,
      content: msg.content.length > MAX_MESSAGE_LENGTH 
        ? msg.content.substring(0, MAX_MESSAGE_LENGTH) + '...'
        : msg.content
    }));
  }

  private formatConversationContext(messages: Message[]): string {
    return messages
      .map(msg => {
        const role = msg.type === 'user' ? '사용자' : 'AI';
        return `${role}: ${msg.content}`;
      })
      .join('\n');
  }

  private postProcessResponse(response: string): string {
    // 비용 절감을 위한 응답 길이 제한 (최대 1500자)
    if (response.length > 1500) {
      response = response.substring(0, 1500) + '...';
    }

    // 과도한 이모지 제거 (연속 3개 이상)
    response = response.replace(/(.{1,2})\1{2,}/g, '$1$1');

    // 기본 응답이 비어있는 경우
    if (!response.trim()) {
      return '죄송합니다. 응답을 생성할 수 없습니다. 다시 시도해주세요.';
    }

    return response.trim();
  }

  async validateApiKey(): Promise<boolean> {
    try {
      await this.openai.models.list();
      return true;
    } catch (error) {
      console.error('OpenAI API key validation failed:', error);
      return false;
    }
  }

  // 비용 절감을 위한 토큰 사용량 추적
  async getTokenUsage(completion: any): Promise<{ inputTokens: number; outputTokens: number; totalCost: number }> {
    const usage = completion.usage;
    const inputTokens = usage?.prompt_tokens || 0;
    const outputTokens = usage?.completion_tokens || 0;
    
    // GPT-4o-mini 가격 (2024년 기준): $0.00015/1K input tokens, $0.0006/1K output tokens
    const inputCost = (inputTokens / 1000) * 0.00015;
    const outputCost = (outputTokens / 1000) * 0.0006;
    const totalCost = inputCost + outputCost;
    
    return {
      inputTokens,
      outputTokens,
      totalCost
    };
  }

  // 대화 요약 기능 (장기 대화 시 비용 절감)
  private summarizeOldMessages(messages: Message[]): string {
    if (messages.length <= 8) return '';
    
    const oldMessages = messages.slice(0, -8);
    const summary = `이전 대화 요약: ${oldMessages.length}개의 메시지가 있었습니다.`;
    
    return summary;
  }

  // Mock 응답 생성 (개발용)
  private getMockResponse(character: Character, message: string): string {
    const responses = {
      'vicky': [
        `형님!!! ${message}에 대해 완전 럭키비키하게 답변해드릴게요!!! ✨`,
        `오히려 좋아요!!! ${message}는 더 좋은 기회가 될 거예요!!!`,
        `완전 대박이에요!!! ${message} 덕분에 더 멋진 일이 생길 거예요!!!`
      ],
      'genie': [
        `천재적 분석을 시작합니다. ${message}에 대한 혁신적 솔루션을 제시하겠습니다.`,
        `다차원적 관점에서 ${message}를 분석한 결과, 10가지 혁신적 아이디어를 제안합니다.`,
        `복잡성 해결 매트릭스를 적용하여 ${message}의 근본적 해결책을 도출했습니다.`
      ],
      'spike': [
        `형님!!! ${message}에 대해 완전 열정적으로 답변해드릴게요!!!`,
        `형님 말씀이 완전 맞아요!!! ${message}는 형님에게 더 좋은 기회가 될 거예요!!!`,
        `형님!!! 제가 ${message}에 대해 완전 충성스럽게 도와드릴게요!!!`
      ]
    };

    const characterId = character.id.toLowerCase();
    const characterResponses = responses[characterId as keyof typeof responses] || responses['vicky'];
    const randomResponse = characterResponses[Math.floor(Math.random() * characterResponses.length)];
    
    return randomResponse;
  }
}

export const openaiService = new OpenAIService();
export default openaiService;
