import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OpenAI } from 'openai';
import { environment } from 'src/environments/environment';
import { dummyCategories } from '../dummy-categories';
import { Card, NavData } from '../interfaces';
import { Countries } from '../models/countries';
import { CountriesService } from '../services/countries.service';
import {catchError, from} from 'rxjs';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit{

  public form: FormGroup;
  public isContentDisplayed: boolean = false;
  public isProgressBarDisplayed: boolean = false;
  public isStateSelected: boolean = false;
  public isFormDisplayed: boolean = false;
  public isUniversityDataLoaded: boolean = false;
  public isTitleDisplayed: boolean = false;
  public openai: OpenAI;
  public cards: Card[] = [];
  public countries: Countries[] = []
  public selectedCountry: Countries;
  public isCountrySelected: boolean = false;
  public statesOfSelectedCountry: string[];
  public selectedState: string;
  public universitiesOfSelectedCombo: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private countriesService: CountriesService
  ){
    this.formBuilder = formBuilder;
  }

  public ngOnInit(): void { 
    this.form = this.formBuilder.group({
      'country': [null, [Validators.required]],
      'state': [null, [Validators.required]],
      'university': [null, [Validators.required]]
    });
    this.prepareCards();
    this.countriesService.getAll().subscribe(c => {
      this.countries = c;
      this.isFormDisplayed = true;
      this.subscribeToCountry();
    });
  }

  public navigate(navData: NavData){
    this.router.navigate(['/category'], {queryParams: navData});
  }

  public submit(){
    this.isFormDisplayed = false;
    this.isTitleDisplayed = true;
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

  public toggleIsUniversityDataLoaded(){
    this.isUniversityDataLoaded = !this.isUniversityDataLoaded;
  }

  public getStringAsTitleCase(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  public onCardClick(card: Card){
    const navData: NavData = {
      category: card.content, 
      country: this.form.value['country'],
      state: this.form.value['state'],
      university: this.form.value['university']
    };
    this.navigate(navData);
  }

  public subscribeToCountry(){
    this.form.get('country')?.valueChanges.subscribe(country => {
      if(!!country){
        this.isCountrySelected = true;
        this.selectedCountry = this.countries.find(_country => _country.name === country);
        this.statesOfSelectedCountry = this.selectedCountry.states;
        this.subscribeToState();
      } else {
        this.isCountrySelected = false;
      }
    });
  }

  public subscribeToState(){
    this.form.get('state')?.valueChanges.subscribe(state => {
      if(!!state){
        this.isStateSelected = true;
        this.selectedState = state;
        this.getUniversities();
      } else {
        this.isStateSelected = false;
      }
    });
  }

  public getUniversities(){
    this.openai = new OpenAI({
      apiKey: this.countriesService.apiKey,
      dangerouslyAllowBrowser: true
    });
    const messageContent = this.prepareUniversityFetchMessageContent();   
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
        this.prepareUniversities(completion);
      },
      error: (err) => {
        console.log(err);
        this.toggleIsProgressbarDisplayed();
    }});
  }

  public prepareUniversities(response: OpenAI.Chat.Completions.ChatCompletion){
    const responseMessageContent: string = response.choices[0].message.content || '';
    const responseAsArray = responseMessageContent.split(';');
    if(responseAsArray.length > 1){
      responseAsArray.forEach(responseString => {
        if(!!responseString){
          this.universitiesOfSelectedCombo.push(responseString.trim());
        }
      });
      this.toggleIsUniversityDataLoaded();
    } else {
      this.prepareUniversities(response);
    }
  }

  public prepareUniversityFetchMessageContent(): string{
    const prefix = `Give me a response of points seperated by ';' without any intro or conclusion like ABCD;XYZ;PQR for the following question `;
    const question = `Tell me top universities in ${this.selectedState}, ${this.selectedCountry}`;
    const message = prefix + question;
    return message;
  }
}
