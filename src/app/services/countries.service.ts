import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Countries } from '../models/countries';
import { map } from 'rxjs';
import { Observable } from 'rxjs';
import { Post } from '../models/post';
import {from} from 'rxjs';
import { PostUserInteraction } from '../models/post-user-interaction';

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

  pushPost(postData: Post): Observable<any> {
    const recordsRef = this.db.database.ref('posts');
    return from(recordsRef.push(postData));
  }

  updatePost(cardToBepdated: Post): Observable<any> {
    const recordsRef = this.db.database.ref('posts');
    return from(recordsRef.child(cardToBepdated.id).update(cardToBepdated));
  }

  pushPostUserInteraction(data: PostUserInteraction): Observable<any> {
    const recordsRef = this.db.database.ref('post-user-interactions');
    return from(recordsRef.push(data));
  }

  removePostUserInteraction(id: string): Observable<any>{
    const recordsRef = this.db.database.ref('post-user-interactions');
    return from(recordsRef.child(id).remove());
  }

  getAllPosts(): Observable<Post[]>{
    return this.db.list<Post>("/posts")
      .snapshotChanges()
      .pipe(
        map(x => x.map((y:any) => ({ id: y.payload?.key, ...y.payload?.val() as Post })))
      );    
  }

  getAllPostUserInteractions(): Observable<PostUserInteraction[]>{
    return this.db.list<Post>("/post-user-interactions")
      .snapshotChanges()
      .pipe(
        map(x => x.map((y:any) => ({ id: y.payload?.key, ...y.payload?.val() as PostUserInteraction })))
      );    
  }
}
