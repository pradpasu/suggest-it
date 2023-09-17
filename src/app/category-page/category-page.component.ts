import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OpenAI } from 'openai';
import { catchError, from } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Card, NavData, SOURCE_AI, SOURCE_DB } from '../interfaces';
import { CountriesService } from '../services/countries.service';
import { Post } from '../models/post';
import { PostUserInteraction } from '../models/post-user-interaction';
import { AuthService } from '../services/auth.service';

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
  public allPosts: Post[] = [];
  public postUserInteractionMap: Map<string, {userid: string, recordid: string}[]> = new Map();
  public userId = 'alksjdhfg';

  constructor(private route: ActivatedRoute, private countriesService: CountriesService, private authService: AuthService){
    this.authService.currentUser$.subscribe(res => {
      this.userId = res.uid;
    })
  }

  public ngOnInit(): void {
    this.openai = new OpenAI({
      apiKey: this.countriesService.apiKey,
      dangerouslyAllowBrowser: true
    }); 
    this.navData = this.getNavDataFromQueryParams();
    this.submit();
    this.getAllPostUserInteractions();
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
      this.countriesService.pushPost(this.getPostDataFromCard(card)).subscribe({
        next: (res) => {
          this.cards = this.cards.filter(c => c.content != card.content);
          this.cards = [...this.cards];
          this.addPostUserInteraction(res.key);
        },
        error: (err) => {
          console.log(err);
        }
      });
    } else {
      const cardToBeUpdated = this.allPosts.find(pc => pc.id === card.id);
      cardToBeUpdated.suggests += 1;
      this.countriesService.updatePost(cardToBeUpdated).subscribe(_res => {
        console.log(_res);
        this.addPostUserInteraction(cardToBeUpdated.id);
      })
    }
  }

  public onUnsuggestItClick(card: Card){
    this.countriesService.removePostUserInteraction(this.getPostUserInteractionId(card)).subscribe(res => {
      const cardToBeUpdated = this.allPosts.find(pc => pc.id === card.id);
      cardToBeUpdated.suggests -= 1;
      this.countriesService.updatePost(cardToBeUpdated).subscribe(_res => {
        console.log(_res);
        if(this.postUserInteractionMap.has(card.id)){
          const newEntries = this.postUserInteractionMap.get(card.id).filter(data => data.userid !== this.userId);
          this.postUserInteractionMap.set(card.id, newEntries);
        }
        this.userPostsCards = [...this.userPostsCards];
      })
    });
  }

  public getPostDataFromCard(card: Card): Post{
    return {
      content: card.content,
      suggests: 1,
      category: this.navData.category,
      state: this.navData.state,
      country: this.navData.country,
      university: this.navData.university
    };
  }

  public getAllPosts(){
    this.countriesService.getAllPosts().subscribe((response: Post[]) => {
      if(response.length > 0){
        this.userPostsCards = [];
        this.allPosts = response;
        response.forEach(p => {
          const nD = this.navData;
          if(p.category == nD.category && p.country == nD.country 
          && p.state == nD.state && p.university.toLowerCase() == nD.university.toLowerCase()){
            this.userPostsCards.push({content: p.content, source: SOURCE_DB, suggests: p.suggests, id: p.id});
          }
        });
        this.isUserPostsDataDisplayed = true;
      }
    });
  }

  public getAllPostUserInteractions(){
    this.countriesService.getAllPostUserInteractions().subscribe((response: PostUserInteraction[]) => {
      if(response.length > 0){
        console.log('Got Post User Interactions');
        console.log(response);
        this.postUserInteractionMap.clear();
        response.forEach(p => {
          if(!this.postUserInteractionMap.has(p.postid)){
            this.postUserInteractionMap.set(p.postid, []);
          }
          this.postUserInteractionMap.get(p.postid).push({userid: p.userid, recordid: p.id});
          console.log(this.postUserInteractionMap);
        });
      }
    });
  }

  public addPostUserInteraction(postId: string){
    this.countriesService.pushPostUserInteraction({
      postid: postId,
      userid: this.userId
    }).subscribe(res => {
      console.log(res);
    })
  }

  public didUserSuggestThis(card: Card){
    if(this.postUserInteractionMap.has(card.id)){
      return !!this.postUserInteractionMap.get(card.id).find(data => data.userid === this.userId);
    }
    return false;
  }

  public getPostUserInteractionId(card: Card){
    return this.postUserInteractionMap.get(card.id).find(data => data.userid === this.userId).recordid;
  }
}
