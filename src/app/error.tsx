'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="panel"><h1>No se pudo mostrar esta vista</h1><p role="alert">Ocurrió un error inesperado. Puede reintentar; los datos guardados localmente no se restablecen con esta acción.</p><button onClick={reset}>Reintentar vista</button></section>;}
