import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page/home-page.component';
import { CountriesComponent } from './components/countries/countries.component';
import { CategoryPageComponent } from './category-page/category-page.component';
import { LoginComponent } from './components/login/login.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';

const routes: Routes = [
  {
    component: HomePageComponent,
    path: "home",
  },
  {
    component: CategoryPageComponent,
    path: "category"
  },
  {
    component: LoginComponent,
    path: ""
  },
  {
    component: SignUpComponent,
    path: "sign-up"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
