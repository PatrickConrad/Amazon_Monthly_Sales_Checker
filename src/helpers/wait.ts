export function wait(minWait: number, log?: boolean) {
    return new Promise(resolve => {
        const time = Math.floor(Math.random() * 2001);
        if(log!=null&&log){
            console.log('TIMEOUT: ', time+minWait)
        }
        setTimeout(resolve, time+minWait);
    });
}

export function shortWait(minWait: number) {
    return new Promise(resolve => {
        const time = Math.floor(Math.random() * 1201);
        setTimeout(resolve, time+minWait);
    });
}
