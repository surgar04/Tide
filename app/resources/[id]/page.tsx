import ClientPage from "../components/ResourceClient";

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return [{ id: 'demo' }];
}

export default function Page() {
    return <ClientPage />;
}
