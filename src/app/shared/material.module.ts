import { NgModule } from '@angular/core';
import {
  MatAutocompleteModule,
  MatButtonModule, MatCardModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatProgressSpinnerModule,
  MatSelectModule,
  MatSlideToggleModule
} from '@angular/material';

const modules = [
  MatInputModule,
  MatButtonModule,
  MatCardModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatDialogModule,
  MatFormFieldModule,
  MatAutocompleteModule
];

@NgModule({
  imports: [modules],
  exports: [modules]
})
export class MaterialModule {
}
