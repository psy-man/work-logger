import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-task',
  templateUrl: './task.template.html'
})
export class TaskComponent implements OnInit {
  @Input() public taskGroup: FormGroup;

  constructor(
    private fb: FormBuilder
  ) { }

  public ngOnInit(): void {
  }

  get workLogsControls() {
    return this.taskGroup.controls['workLogs']['controls'];
  }

  public removeWorkLog(idx: number): void {
    const workLogs = this.taskGroup.get('workLogs') as FormArray;
    workLogs.removeAt(idx);
  }
}
