import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {OpenAI} from 'openai';
import {catchError, from} from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Card{
  content: string;
  source: string;
}

export const SOURCE_AI = 'AI Recommended';
export const SOURCE_DB = 'User Recommended'; 

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit{

  public universityForm: FormGroup;
  public isContentDisplayed: boolean = false;
  public isProgressBarDisplayed: boolean = false;
  public openai: OpenAI;
  public cards: Card[] = [];

  constructor(private formBuilder: FormBuilder){
    this.formBuilder = formBuilder;
    this.universityForm = this.formBuilder.group({
      'university': [null, [Validators.required]]
    });
    this.openai = new OpenAI({
      apiKey: environment.openai.api_key, // defaults to process.env["OPENAI_API_KEY"]
      dangerouslyAllowBrowser: true
    }); 
  }

  public ngOnInit(): void {
  }

  public submit(){
    const university = this.universityForm.value['university'];
    const messageContent = this.prepareOpenAiMessageContent(university);   
    this.toggleIsProgressbarDisplayed();
    from(this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{role: 'user', content: messageContent}]
    }))
    .pipe(
      catchError(error => {throw error})
    )
    .subscribe({
      next: (completion) => {
        this.toggleIsProgressbarDisplayed();
        this.prepareCards(completion);
      },
      error: (err) => {
        console.log(err);
        this.toggleIsProgressbarDisplayed();
    }});
  }

  public prepareCards(response: OpenAI.Chat.Completions.ChatCompletion){
    console.log(response.choices[0].message.content);
    const responseMessageContent: string = response.choices[0].message.content || '';
    const responseAsArray = responseMessageContent.split(';');
    if(responseAsArray.length > 0){
      responseAsArray.forEach(responseString => {
        if(!!responseString){
          this.cards.push(
            {
              content: this.getStringAsTitleCase(responseString.trim()),
              source: SOURCE_AI
            }
          );
        }
      });
      this.toggleIsContentDisplayed();
    }
  }

  public prepareOpenAiMessageContent(subject: string): string{
    const prefix = `Give me a response of points seperated by ';' without any intro or 
    conclusion like ABCD;XYZ;PQR for the following question `;
    const question = `Tell me must know clothing tips that incoming students to ${subject} must know`;
    const message = prefix + question;
    return message;
  }

  public toggleIsProgressbarDisplayed(){
    this.isProgressBarDisplayed = !this.isProgressBarDisplayed;
  }
  
  public toggleIsContentDisplayed(){
    this.isContentDisplayed = !this.isContentDisplayed;
  }

  public getStringAsTitleCase(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
