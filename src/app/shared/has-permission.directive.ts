import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { PermissionService } from './permission.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appHasPermission]'
})
export class HasPermissionDirective implements OnDestroy {
  private permissionSubscription!: Subscription;
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionService: PermissionService
  ) {}

  @Input() set appHasPermission(permission: string) {
    if (this.permissionSubscription) {
      this.permissionSubscription.unsubscribe();
    }

    this.permissionSubscription = this.permissionService.userPermissions$.subscribe((permissions) => {
      this.viewContainer.clear();
      if (permissions.hasOwnProperty(permission)) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }

  ngOnDestroy() {
    if (this.permissionSubscription) {
      this.permissionSubscription.unsubscribe();
    }
  }
}
