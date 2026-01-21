import { ContentChild, ContentChildren, Directive, QueryList } from "@angular/core";
import { NgControl } from "@angular/forms";
import { SelectGroupDirective } from "./SelectGroup";
import { merge } from "rxjs";

@Directive({ selector: '[checkChildren]' })
export class CheckChildrenDirective {
  @ContentChildren(NgControl, { descendants: true }) controls!: QueryList<NgControl>;
  @ContentChild(SelectGroupDirective) selectGroup!: SelectGroupDirective;

  ngAfterContentInit() {
    if(this.selectGroup != undefined) {
    this.selectGroup.checkChanges$.subscribe((checked) => {
      this.controls.forEach(({ control }) => control!.patchValue(checked));
    });

    const changes = this.controls.map(({ control }) => control!.valueChanges);

    merge(...changes).subscribe(() => {
      this.selectGroup.checked = 
           this.controls.toArray().every(({ control }) => control!.value);
    });
  }
}
}