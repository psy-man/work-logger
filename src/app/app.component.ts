import { ChangeDetectionStrategy, ChangeDetectorRef, Component, NgZone, OnInit, ViewEncapsulation } from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import { ElectronService } from 'ngx-electron';
import { MatDialog } from '@angular/material';

import { ResponseDialogComponent } from './response-dialog/response-dialog.component';
import { WorkLog } from './shared/models/work-log.interface';
import { Task } from './shared/models/task.interface';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-root',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './app.component.scss'
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  public form: FormGroup;
  public showMessageInput = false;
  public sending = true;

  public stateCtrl: FormControl;
  public filteredStates: any;
  public states = [];

  constructor(public fb: FormBuilder,
              private electron: ElectronService,
              private ngZone: NgZone,
              private changeDetectorRef: ChangeDetectorRef,
              public dialog: MatDialog) {
    this.stateCtrl = new FormControl('', [Validators.required]);

    this.filteredStates = this.stateCtrl.valueChanges
      .pipe(
        startWith(null),
        map((state) => state ? this.filterStates(state) : this.states.slice())
      );
  }

  public ngOnInit() {
    this.electron.ipcRenderer.removeAllListeners('reminder');
    this.electron.ipcRenderer.removeAllListeners('submit-reply');
    this.electron.ipcRenderer.removeAllListeners('findIssue');

    this.electron.ipcRenderer.on('submit-reply', (event, arg) => {
      this.ngZone.run(() => {
        this.sending = false;
        this.initForm();

        this.dialog.open(ResponseDialogComponent, {
          width: '80%',
          height: '80%',
          data: {
            response: JSON.stringify(arg, null, 4)
          }
        });

        this.changeDetectorRef.markForCheck();
      });
    });

    this.electron.ipcRenderer.on('reminder', (event, arg) => {
      this.ngZone.run(() => {
        const myNotification = new Notification('Reminder', {
          body: 'Please send your work logs'
        });
      });
    });

    this.electron.ipcRenderer.on('findIssue', (event, list) => {
      this.ngZone.run(() => {
        this.states = list.issues
          .filter(({key}) => !key.includes('TCM-'))
          .map(({key, fields}) => {
            return {
              key, title: fields.summary
            };
          });
        this.sending = false;

        this.changeDetectorRef.markForCheck();
      });
    });

    this.initForm();

    this.electron.ipcRenderer.send('findIssue');
    this.changeDetectorRef.detectChanges();
  }

  get tasksControls() {
    return this.form.controls['tasks']['controls'];
  }

  get totalTime(): number {
    const tasks = this.form.value.tasks;
    let total = 0;

    tasks.forEach((task: Task) => {
      task.workLogs.forEach((workLog: WorkLog) => {
        total += Number(workLog.time);
      });
    });

    return total;
  }

  public addClientTask(issueId): void {
    const issue = this.states.find((i) => i.key === issueId);

    const control = this.form.controls['tasks'] as FormArray;
    const task = this.initTask(issue);

    control.push(task);
    this.stateCtrl.reset();
  }

  public removeTask(i: number): void {
    const control = this.form.controls['tasks'] as FormArray;
    control.removeAt(i);
  }

  public addWorkLog(control: FormArray): void {
    const workLogs = control.get('workLogs') as FormArray;

    workLogs.push(this.initWorkLog());
  }

  public toggleMessageInput() {
    this.showMessageInput = !this.showMessageInput;
  }

  public onSubmit(model: AbstractControl): void {
    if (this.electron.isElectronApp) {
      this.sending = true;
      this.electron.ipcRenderer.send('submit', model.value);
    }
  }

  private filterStates(name: string) {
    return this.states.filter((state) =>
      state.key.toLowerCase().includes(name.toLowerCase()) ||
      state.title.toLowerCase().includes(name.toLowerCase()));
  }

  private initForm() {
    this.form = this.fb.group({
      message: [''],
      tasks: this.fb.array([])
    });

    // this.addClientTask();
    this.showMessageInput = false;
  }

  private initTask(issue): FormGroup {
    return this.fb.group({
      id: [issue.key, [Validators.required]],
      name: [issue.title],
      workLogs: this.fb.array([
        this.initWorkLog()
      ])
    });
  }

  private initWorkLog(): FormGroup {
    return this.fb.group({
      id: [''],
      description: ['', [Validators.required]],
      time: ['', [Validators.required]]
    });
  }
}
