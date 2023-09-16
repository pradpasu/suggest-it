import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Countries } from 'src/app/models/countries';
import { CountriesService } from 'src/app/services/countries.service';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss']
})
export class CountriesComponent implements OnInit {

  countries: Countries[] = []
  locationForm: FormGroup;
  selectedCountry: Countries;
  isCountrySelected: boolean = false;
  statesOfSelectedCountry: string[];

  constructor(private countriesService: CountriesService, private formBuilder: FormBuilder) {
    this.createLocationForm();
  }

  ngOnInit(): void {
    this.countriesService.getAll().subscribe(c => this.countries = c);
  }

  public createLocationForm(){
    this.locationForm = this.formBuilder.group({
      'country': [null, [Validators.required]],
      'state': [null, [Validators.required]]
    });
    this.subscribeToCountry();
  }

  public subscribeToCountry(){
    this.locationForm.get('country')?.valueChanges.subscribe(country => {
      if(!!country){
        this.isCountrySelected = true;
        this.selectedCountry = this.countries.find(_country => _country.name === country);
        this.statesOfSelectedCountry = this.selectedCountry.states;
      } else {
        this.isCountrySelected = false;
      }
    });
  }

  public onSubmit(){
    console.log(this.locationForm.value);
  }
}
