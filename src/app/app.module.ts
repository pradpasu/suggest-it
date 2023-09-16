import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AngularFireModule } from '@angular/fire/compat';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomePageComponent } from './home-page/home-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon'
import { environment } from 'src/environments/environment';
import { CountriesComponent } from './components/countries/countries.component';
import {MatSelectModule} from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    HomePageComponent,
    CountriesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatSidenavModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    AngularFireModule.initializeApp(environment.firebase),
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
