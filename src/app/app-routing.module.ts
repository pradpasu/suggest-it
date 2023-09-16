import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { CountriesComponent } from './components/countries/countries.component';

const routes: Routes = [
  {
    component: CountriesComponent,
    path: "",
    
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
