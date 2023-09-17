import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {OpenAI} from 'openai';
import {catchError, from} from 'rxjs';
import { environment } from 'src/environments/environment';
import { Card, NavData, SOURCE_AI } from '../interfaces';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Component({
  selector: 'app-category-page',
  templateUrl: './category-page.component.html',
  styleUrls: ['./category-page.component.scss']
})
export class CategoryPageComponent {
  public isContentDisplayed: boolean = false;
  public isProgressBarDisplayed: boolean = false;
  public openai: OpenAI;
  public cards: Card[] = [];
  public navData: NavData;

  constructor(private route: ActivatedRoute){
    this.openai = new OpenAI({
      apiKey: environment.openai.api_key,
      dangerouslyAllowBrowser: true
    }); 
  }

  public ngOnInit(): void {
    this.navData = this.getNavDataFromQueryParams();
    this.submit();
  }

  public getNavDataFromQueryParams(): NavData{
    const queryParamMap = this.route.snapshot.queryParamMap;
    return {category: queryParamMap.get('category') as string, university: queryParamMap.get('university') as string};
  }

  public submit(){
    const messageContent = this.prepareOpenAiMessageContent();   
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
    if(responseAsArray.length > 1){
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
    } else {
      this.submit();
    }
  }

  public prepareOpenAiMessageContent(): string{
    const prefix = `Give me a response of points seperated by ';' without any intro or 
    conclusion like ABCD;XYZ;PQR for the following question `;
    const question = `Tell me must know ${this.navData.category} tips that incoming students to 
    specifically ${this.navData.university} must know`;
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
