export function createOnceLogger(label) {
    let loggedInitial = false;
    let loggedSuccess = false;

    const logInitial = (value) => {
        if (loggedInitial) return;
        console.log(`${label} value:`, value);
        loggedInitial = true;
    };

    const logSuccess = (value) => {
        if (loggedSuccess) return;
        console.log(`${label} success:`, value);
        loggedSuccess = true;
    };

    return {
        logInitial,
        logSuccess,
    };
}
