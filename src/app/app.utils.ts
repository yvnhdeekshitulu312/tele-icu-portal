export function getLandingPage() {
    const doctorDetails = JSON.parse(sessionStorage.getItem("doctorDetails") || '{}')[0];
    if (doctorDetails.IsDoctor || doctorDetails.IsRODoctor) {
        return ['/login/doctor-home'];
    }
    else if ((doctorDetails.IsERHeadNurse || doctorDetails.IsWardNurse) && !doctorDetails.IsERNurse) {
        return ['/ward'];
    }
    else if (doctorDetails.IsERNurse) {
        return ['/emergency/worklist']
    }
    else if (doctorDetails.IsNurse) {
        return ['/emergency/worklist'];
    }
    else if (doctorDetails.IsORHeadNurse) {
        return ['/ot/ot-dashboard'];
    }
    else if (doctorDetails.IsAKUNurse) {
        return ['/dialysis/aku-worklist'];
    }
    else if (doctorDetails.IsEndoscopyNurse) {
        return ['suit/radiologyworklist'];
    }
    else if (doctorDetails.IsAnesthetia) {
        return ['/portal/anesthetia-worklist'];
    }
    else {
        return ['/suit'];
    }
}

export function isEmptyOrDots(value: string): boolean {
    if (value) {
        const trimmed = value.trim();
        return /^\.*$/.test(trimmed);
    }
    return true;
}

export function isOnlyDots(value: string): boolean {
    const trimmed = value ? value.trim() : '';
    if (!trimmed) return false;
    return /^\.*$/.test(trimmed);
}