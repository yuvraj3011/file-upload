import { Component, OnInit } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { FileUpload } from './file-upload';

import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  title = 'file-uploader';

  private basePath = '/uploads';

  file: FileUpload;

  uploadedFiles = [];

  progress: number = 0;

  constructor(private storage: AngularFireStorage) { }

  async ngOnInit(): Promise<void> {
    try{
      this.uploadedFiles = JSON.parse(await localStorage.getItem('files'));
    }catch(err){
      this.uploadedFiles = [];
    }
  }

  pushFileToStorage(fileUpload: FileUpload): Observable<number> {
    const filePath = `${this.basePath}/${fileUpload.file.name}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);
    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe(downloadURL => {
          fileUpload.url = downloadURL;
          fileUpload.name = fileUpload.file.name;
          this.saveFileData(fileUpload);
        });
      })
    ).subscribe();
    return uploadTask.percentageChanges();
  }

  addFile(event){
    console.log(event.target.files[0]);
    this.file = new FileUpload(event.target.files[0]);
    //this.filePath = event.target.files[0];
  }

  async saveFileData(file: FileUpload){
    try{
      let files: any[] = JSON.parse(await localStorage.getItem('files'));
      files.push(file);
      localStorage.setItem('files', JSON.stringify(files));
    }catch(err){
      let files = [file];
      localStorage.setItem('files', JSON.stringify(files));
    }
    this.uploadedFiles!.push(file);
  }

  upload(){
    this.pushFileToStorage(this.file).subscribe((res) => {
      this.progress = res;
      console.log(this.progress);
    });
  }
  
}
