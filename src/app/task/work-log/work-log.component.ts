import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-work-log',
  templateUrl: './work-log.template.html'
})
export class WorkLogComponent {
  @Input() public index: number;
  @Input() public removable: boolean;
  @Input() public workLogGroup: FormGroup;

  @Output() public removeWorkLogEvent = new EventEmitter<number>();

  public removeWorkLog() {
    this.removeWorkLogEvent.emit(this.index);
  }
}
