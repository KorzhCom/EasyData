import 'bootstrap/dist/css/bootstrap.css';
import '@easydata/ui/dist/assets/css/easy-grid.css';
import '@easydata/ui/dist/assets/css/easy-dialog.css';
import '@easydata/ui/dist/assets/css/easy-forms.css';
import '@easydata/crud/dist/assets/css/ed-view.css';
import './custom.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);
