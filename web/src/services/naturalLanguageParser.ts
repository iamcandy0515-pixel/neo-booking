
import * as chrono from 'chrono-node';

export interface ParsedResult {
  date: Date | null;
  text: string;
  intent?: 'book' | 'cancel' | 'inquiry';
  name?: string;
  phone?: string;
}

export const NaturalLanguageParser = {
  /**
   * Parse natural language text into structured data (Date, Intent, Name, Phone)
   * Example: "3월 15일 홍길동 010-1234-5678 예약" -> Date, Name='홍길동', Phone='010-1234-5678'
   */
  parse(text: string): ParsedResult {
    // 1. Parse Date using chrono-node (Korean support)
    let results = chrono.parse(text, new Date(), { forwardDate: true });
    
    let parsedDate: Date | null = null;
    if (results.length > 0) {
      parsedDate = results[0].start.date();
    } else {
        // Fallback: Explicit Regex for "X월 X일"
        const dateRegex = /([0-9]{1,2})월\s*([0-9]{1,2})일/;
        const match = text.match(dateRegex);
        if (match) {
            const month = parseInt(match[1]);
            const day = parseInt(match[2]);
            const today = new Date();
            // Basic logic: if month is earlier than current month, assume next year
            const year = (month < today.getMonth() + 1) ? today.getFullYear() + 1 : today.getFullYear();
            parsedDate = new Date(year, month - 1, day);
        }
    }

    // 2. Simple Intent Detection
    let intent: ParsedResult['intent'] = 'book'; // default
    if (text.includes('취소')) {
      intent = 'cancel';
    } else if (text.includes('확인') || text.includes('조회')) {
      intent = 'inquiry';
    }

    // 3. Phone Number Extraction (010-xxxx-xxxx or 010xxxxxxxx)
    const phoneRegex = /(01[016789])[- .]?([0-9]{3,4})[- .]?([0-9]{4})/;
    const phoneMatch = text.match(phoneRegex);
    let phone = phoneMatch ? phoneMatch[0] : undefined;

    // 4. Name Extraction (Heuristic: 2-4 Korean chars, excluding keywords)
    let name = undefined;
    const nameRegex = /[가-힣]{2,4}/g;
    const keywords = ['예약', '취소', '확인', '조회', '내일', '모레', '오늘', '다음', '이번', '요일', '주말', '오전', '오후'];
    
    // Using matches iterator approach
    const possibleNames = text.match(nameRegex) || [];
    for (const token of possibleNames) {
        // Skip keywords
        if (!keywords.some(k => token.includes(k))) {
            name = token;
            break; // Take the first likely name
        }
    }

    return {
      date: parsedDate,
      text,
      intent,
      name,
      phone
    };
  }
};
