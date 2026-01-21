import { Component, ViewChild } from "@angular/core";
import { SpecializationComponent } from "../specialization/specialization.component";
import { BedsMasterComponent } from "../beds-master/beds-master.component";

declare var $: any;

@Component({
    selector: 'app-masters-landing',
    templateUrl: './masters-landing.component.html'
})
export class MastersLandingComponent {
    public selectedId: number = 1;
    public filteredMasterTypesList: any = [];
    public masterTypesList: any = [
        { id: 1, name: 'Specialization' },
        { id: 2, name: 'Facilities' },
        { id: 3, name: 'Beds' },
        { id: 4, name: 'Rooms' },
        { id: 5, name: 'Organisation Details' },
        { id: 6, name: 'Departments' },
        { id: 7, name: 'Map Departments' },
        { id: 8, name: 'Bed Types' }
    ];
    @ViewChild('specilizationView', { static: false })
    specilizationView: SpecializationComponent | undefined;
    @ViewChild('bedView', { static: false })
    bedView: BedsMasterComponent | undefined;
    

    constructor() {
        this.filteredMasterTypesList = [...this.masterTypesList];
    }

    filterItems(event: any) {
        this.filteredMasterTypesList = this.masterTypesList.filter((item: any) =>
            item.name.toLowerCase().includes(event.target.value.toLowerCase().trim())
        );
    }

    save() {
        switch (this.selectedId) {
            case 1:
                this.specilizationView?.save();
                break;
        }
    }

    clear() {
        switch (this.selectedId) {
            case 1:
                this.specilizationView?.clear();
                break;
        }
    }
}