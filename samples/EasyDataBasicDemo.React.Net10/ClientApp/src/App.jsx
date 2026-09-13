import { Route, Routes } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Home';
import Counter from './components/Counter';
import FetchData from './components/FetchData';
import EasyData from './components/EasyData';

export default function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/counter" element={<Counter />} />
                <Route path="/fetch-data" element={<FetchData />} />
                {/* EasyData navigates to /easydata/<entity> on its own, so match the whole subtree */}
                <Route path="/easydata/*" element={<EasyData />} />
            </Routes>
        </Layout>
    );
}
