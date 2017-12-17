import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-response-dialog',
  templateUrl: './response-dialog.template.html',
})
export class ResponseDialogComponent {
  constructor(public dialogRef: MatDialogRef<ResponseDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {
  }
}
