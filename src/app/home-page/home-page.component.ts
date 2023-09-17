import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {OpenAI} from 'openai';
import {catchError, from} from 'rxjs';
import { environment } from 'src/environments/environment';
import { Card, NavData, SOURCE_AI } from '../interfaces';
import { Router } from '@angular/router';
import { dummyCategories } from '../dummy-categories';

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

  constructor(private formBuilder: FormBuilder, private router: Router){
    this.formBuilder = formBuilder;
    this.universityForm = this.formBuilder.group({
      'university': [null, [Validators.required]]
    });
    this.openai = new OpenAI({
      apiKey: environment.openai.api_key,
      dangerouslyAllowBrowser: true
    }); 
    this.prepareCards();
  }

  public ngOnInit(): void {
  }

  public navigate(navData: NavData){
    this.router.navigate(['/category'], {queryParams: navData});
  }

  public submit(){
    this.toggleIsContentDisplayed();
  }

  public prepareCards(){
    this.cards = dummyCategories;
  }

  public prepareOpenAiMessageContent(subject: string): string{
    const prefix = `Give me a response of points seperated by ';' without any intro or 
    conclusion like ABCD;XYZ;PQR for the following question `;
    const question = `Tell me must know clothing tips that incoming students to specifically ${subject} must know`;
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

  public onCardClick(card: Card){
    const navData: NavData = {category: card.content, university: this.universityForm.value['university']};
    this.navigate(navData);
  }
}
