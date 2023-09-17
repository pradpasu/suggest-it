import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Countries } from '../models/countries';
import { map } from 'rxjs';
import { Observable } from 'rxjs';
import { Post } from '../models/post';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  constructor(private db: AngularFireDatabase) { }

  getAll(): Observable<Countries[]>{
    return this.db.list<Countries>("/countries")
              .snapshotChanges()
              .pipe(
                map(x => x.map((y:any) => ({ id: y.payload?.key, ...y.payload?.val() as Countries })))
              );
  }

  push() {
    const recordsRef = this.db.database.ref('countries');
    const newRecordData = {
      name: 'India',
      states: ['Jammu Kashmir', 'Telangana', 'Andhra Pradesh']
    };
    recordsRef.push(newRecordData)
      .then(() => {
        console.log('Record added successfully');
      })
      .catch((error) => {
        console.error('Error adding record:', error);
      });
  }

  pushPost(postData: Post) {
    const recordsRef = this.db.database.ref('posts');
    recordsRef.push(postData)
      .then(() => {
        console.log('Record added successfully');
      })
      .catch((error) => {
        console.error('Error adding record:', error);
      });
  }

  getAllPosts(): Observable<Post[]>{
    return this.db.list<Post>("/posts")
      .snapshotChanges()
      .pipe(
        map(x => x.map((y:any) => ({ id: y.payload?.key, ...y.payload?.val() as Post })))
      );    
  }
}
