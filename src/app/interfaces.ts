
export interface Card{
    content: string;
    source: string;
  };
  
export interface NavData{
    university: string;
    category: string;
}
  
export const SOURCE_AI = 'AI Recommended';
export const SOURCE_DB = 'User Recommended'; 
export const SOURCE_US = 'Editor Recommended';