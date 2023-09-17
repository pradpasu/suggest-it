import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OpenAI } from 'openai';
import { catchError, from } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Card, NavData, SOURCE_AI, SOURCE_DB } from '../interfaces';
import { CountriesService } from '../services/countries.service';
import { Post } from '../models/post';

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
  public isUserPostsDataDisplayed: boolean = false;
  public userPostsCards: Card[] = [];

  constructor(private route: ActivatedRoute, private countriesService: CountriesService){
    this.openai = new OpenAI({
      apiKey: environment.openai.api_key,
      dangerouslyAllowBrowser: true
    }); 
  }

  public ngOnInit(): void {
    this.navData = this.getNavDataFromQueryParams();
    this.submit();
    this.getAllPosts();
  }

  public getNavDataFromQueryParams(): NavData{
    const queryParamMap = this.route.snapshot.queryParamMap;
    return {
      category: queryParamMap.get('category') as string, 
      country: queryParamMap.get('country') as string,  
      state: queryParamMap.get('state') as string, 
      university: queryParamMap.get('university') as string
    };
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
    const responseAsArray = responseMessageContent.split('#');
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
    } else {
      this.submit();
    }
  }

  public prepareOpenAiMessageContent(): string{
    const prefix = `Give me couple of single line points in the following format
    # This is the first example point
    # This is the second example point
    # This is the third example point
    `;
    const question = `The question is: Tell me must know ${this.navData.category} tips that incoming immigrant students to ${this.navData.university} in ${this.navData.state}, ${this.navData.country} must know`;
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

  public onSuggestItClick(card: Card){
    if(!card.id){
      this.countriesService.pushPost(this.getPostDataFromCard(card));
    }
  }

  public getPostDataFromCard(card: Card): Post{
    return {
      content: card.content,
      suggests: 1
    };
  }

  public getAllPosts(){
    this.countriesService.getAllPosts().subscribe((response: Post[]) => {
      if(response.length > 0){
        response.forEach(p => {
          this.userPostsCards.push({content: p.content, source: SOURCE_DB, suggests: p.suggests})
        })
        this.isUserPostsDataDisplayed = true;
      }
    })
  }
}
