const demoItems = [
  { id: "avatar-star", name: "Avatar ngôi sao", price: 20 },
  { id: "sticker-rocket", name: "Sticker tên lửa", price: 15 },
  { id: "sticker-crown", name: "Sticker vương miện", price: 25 }
];

export function ShopPage() {
  return (
    <div className="page">
      <h2>Cửa hàng</h2>
      <p className="muted">Dùng sao để mua avatar và sticker (demo, chưa nối Firebase).</p>
      <div className="grid">
        {demoItems.map((item) => (
          <article className="card" key={item.id}>
            <h3>{item.name}</h3>
            <p className="muted">Giá: {item.price} ⭐</p>
            <button className="btn primary" disabled>
              Mua (demo)
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
