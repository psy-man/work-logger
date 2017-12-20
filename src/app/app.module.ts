import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MaterialModule } from './shared/material.module';

import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxElectronModule } from 'ngx-electron';
import { TaskComponent } from './task/task.component';
import { WorkLogComponent } from './task/work-log/work-log.component';
import { ResponseDialogComponent } from './response-dialog/response-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatAutocompleteModule} from '@angular/material';


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxElectronModule,
    MatAutocompleteModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    TaskComponent,
    WorkLogComponent,
    ResponseDialogComponent
  ],
  entryComponents: [
    ResponseDialogComponent
  ],
})
export class AppModule {
}
