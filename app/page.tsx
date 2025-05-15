export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">ისლამური ლოცვის დროების სერვერი</h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">API ენდპოინტები:</h2>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <code className="bg-gray-100 p-1 rounded">/api/countries</code> -
              <span className="ml-2">ყველა ქვეყნის სია</span>
            </li>
            <li>
              <code className="bg-gray-100 p-1 rounded">/api/cities?countryId=2</code> -
              <span className="ml-2">ქალაქების სია ქვეყნის ID-ით</span>
            </li>
            <li>
              <code className="bg-gray-100 p-1 rounded">/api/districts?cityId=500</code> -
              <span className="ml-2">რაიონების სია ქალაქის ID-ით</span>
            </li>
            <li>
              <code className="bg-gray-100 p-1 rounded">/api/prayer-times?countryId=2&date=2023-05-15</code> -
              <span className="ml-2">ლოცვის დროები ქვეყნის მიხედვით</span>
            </li>
            <li>
              <code className="bg-gray-100 p-1 rounded">/api/prayer-times?cityId=500&date=2023-05-15</code> -
              <span className="ml-2">ლოცვის დროები ქალაქის მიხედვით</span>
            </li>
            <li>
              <code className="bg-gray-100 p-1 rounded">/api/prayer-times?districtId=9541&date=2023-05-15</code> -
              <span className="ml-2">ლოცვის დროები რაიონის მიხედვით</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">როგორ მუშაობს:</h2>
          <p className="mb-2">
            სერვერი ავტომატურად ინახავს (caching) ლოცვის დროებს 24 საათის განმავლობაში. თუ რამდენიმე მომხმარებელი
            მოითხოვს ერთი და იგივე ქალაქის ლოცვის დროებს, სერვერი მხოლოდ ერთხელ გააგზავნის მოთხოვნას Diyanet API-ზე და
            შემდეგ გამოიყენებს შენახულ მონაცემებს.
          </p>
          <p>ქვეყნების, ქალაქებისა და რაიონების სიები ინახება 7 დღის განმავლობაში.</p>
        </div>

        <div className="mt-6 text-center">
          <a href="/example" className="text-blue-600 hover:underline">
            გადადით მაგალითის გვერდზე
          </a>
        </div>
      </div>
    </main>
  )
}