

const BookCard = () => {
    return (
        <div>
            <div class="max-w-sm mx-auto">
                <div class="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition duration-300">
                    {/* <!-- Book Cover --> */}
                    <img
                        class="w-full h-65 object-cover"
                        src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"
                        alt="Book Cover"
                    />

                    {/* <!-- Content --> */}
                    <div class="p-4">
                        <h2 class="text-xl font-bold text-gray-800">The Great Gatsby</h2>
                        <p class="text-sm text-gray-600 mt-1">by F. Scott Fitzgerald</p>

                        {/* <!-- Description --> */}
                        <p class="text-gray-700 text-sm mt-3 line-clamp-3">
                            A classic novel set in the Jazz Age, The Great Gatsby tells the story of the mysterious millionaire Jay Gatsby and his obsession with Daisy Buchanan.
                        </p>

                        {/* <!-- Footer --> */}
                        <div class="flex items-center justify-between mt-4">
                            <span class="text-lg font-semibold text-indigo-600">$12.99</span>
                            <button class="px-3 py-1 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition">
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default BookCard
