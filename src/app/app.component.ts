import { Component } from '@angular/core';
import OpenAI from 'openai';
import {from} from 'rxjs'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'suggest-it';
}
