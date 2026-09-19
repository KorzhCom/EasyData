import { useEffect } from 'react';
import { EasyDataViewDispatcher } from '@easydata/crud';

export default function EasyData() {
    useEffect(() => {
        const viewDispatcher = new EasyDataViewDispatcher();
        viewDispatcher.run();

        return () => viewDispatcher.detach();
    }, []);

    return <div id="EasyDataContainer"></div>;
}
