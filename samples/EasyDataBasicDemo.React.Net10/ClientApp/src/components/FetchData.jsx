import { useEffect, useState } from 'react';

export default function FetchData() {
    const [forecasts, setForecasts] = useState(null);

    useEffect(() => {
        let ignore = false;

        fetch('/weatherforecast')
            .then(response => response.json())
            .then(data => { if (!ignore) setForecasts(data); });

        return () => { ignore = true; };
    }, []);

    return (
        <div>
            <h1 id="tableLabel">Weather forecast</h1>
            <p>This component demonstrates fetching data from the server.</p>
            {forecasts === null
                ? <p><em>Loading...</em></p>
                : (
                    <table className="table table-striped" aria-labelledby="tableLabel">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Temp. (C)</th>
                                <th>Temp. (F)</th>
                                <th>Summary</th>
                            </tr>
                        </thead>
                        <tbody>
                            {forecasts.map(forecast =>
                                <tr key={forecast.date}>
                                    <td>{new Date(forecast.date).toLocaleDateString()}</td>
                                    <td>{forecast.temperatureC}</td>
                                    <td>{forecast.temperatureF}</td>
                                    <td>{forecast.summary}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
        </div>
    );
}
