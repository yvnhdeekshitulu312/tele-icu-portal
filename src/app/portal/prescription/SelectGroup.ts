import { Directive, ElementRef } from "@angular/core";
import { fromEvent, map } from "rxjs";

@Directive({ selector: '[selectGroup]' })
export class SelectGroupDirective {
  checkChanges$ = fromEvent(this.host.nativeElement, 'change').pipe(
    map((e: any) => e.target.checked)
  )

  constructor(private host: ElementRef<HTMLInputElement>) { }

  set checked(checked: boolean) {
    this.host.nativeElement.checked = checked;
  }

}