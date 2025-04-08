export default function TestPage({ params }: { params: { slug: string } }) {
  return (
    <div className='container p-8'>
      <h1 className='text-2xl font-bold mb-4'>Test Route Page</h1>
      <div className='p-4 bg-gray-100 rounded'>
        <p>
          Slug parameter: <strong>{params.slug}</strong>
        </p>
      </div>
    </div>
  );
}
