export default function Home() {
    return (
        <div>
            <h1>EasyData Basic Demo</h1>
            <p>A single-page application built with:</p>
            <ul>
                <li><a href="https://dotnet.microsoft.com/apps/aspnet">ASP.NET Core</a> and C# for the server side</li>
                <li><a href="https://react.dev/">React</a> and <a href="https://vite.dev/">Vite</a> for the client side</li>
                <li><a href="https://getbootstrap.com/">Bootstrap</a> for layout and styling</li>
                <li><a href="https://github.com/KorzhCom/EasyData">EasyData</a> for the CRUD views over the database</li>
            </ul>
            <p>Open the <strong>EasyData</strong> page to browse, filter, and edit the demo database.</p>
            <ul>
                <li><strong>Development server integration</strong>. In development, running the ASP.NET Core project starts the Vite dev server in the background, so the page refreshes whenever you change a client file.</li>
                <li><strong>Production builds</strong>. <code>dotnet publish</code> runs <code>npm run build</code> and puts the bundled client files into <code>wwwroot</code>.</li>
            </ul>
            <p>The <code>ClientApp</code> folder is a standard Vite + React application: run <code>npm run dev</code> or <code>npm run build</code> there as usual.</p>
        </div>
    );
}
