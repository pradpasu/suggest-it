
export interface Card{
    id?: string;
    content: string;
    source: string;
    suggests?: number;
  };
  
export interface NavData{
    country: string;
    state: string;
    university?: string;
    category: string;
}
  
export const SOURCE_AI = 'AI Recommended';
export const SOURCE_DB = 'User Recommended'; 
export const SOURCE_US = 'Editor Recommended';