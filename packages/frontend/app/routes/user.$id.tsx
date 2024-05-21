import { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';


export const loader = async ({ params }: LoaderFunctionArgs) => {
  const response = await fetch(`${process.env.API_URL}/api/user/${params.id}`);
  if (!response.ok) {
    throw new Response('User not found', { status: 404 });
  }
  return response.json();
};

export default function UserProfilePage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <p className="leading-7">
        Hello, {data.firstName}!
      </p>
    </div>
  );
}