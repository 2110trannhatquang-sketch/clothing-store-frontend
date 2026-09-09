import React from 'react';

const About = () => {
  return (
    <div style={styles.container}>
      {/* Tiêu đề trang */}
      <div style={styles.header}>
        <h2 style={styles.title}>VỀ CHÚNG TÔI</h2>
        <p style={styles.subtitle}>MINIMALIST FASHION HOUSE</p>
      </div>

      {/* Nội dung chi tiết */}
      <div style={styles.contentWrapper}>
        <div style={styles.imageSection}>
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000&auto=format&fit=crop" 
            alt="About Us" 
            style={styles.image} 
          />
        </div>
        
        <div style={styles.textSection}>
          <h3 style={styles.sectionTitle}>TRIẾT LÝ THỜI TRANG TỐI GIẢN</h3>
          <p style={styles.paragraph}>
            Ra đời với sứ mệnh mang đến sự thanh lịch thông qua những thiết kế tối giản, chúng tôi tin rằng phong cách thực sự không nằm ở sự phô trương, mà ẩn giấu trong từng đường kim mũi chỉ và chất liệu tuyển chọn kỹ lưỡng.
          </p>
          <p style={styles.paragraph}>
            Mỗi sản phẩm tại Minimalist đều được thiết kế với sự tỉ mỉ cao độ, giúp bạn dễ dàng kết hợp trong mọi hoàn cảnh – từ không gian công sở chuyên nghiệp đến những buổi dạo phố nhẹ nhàng cuối tuần.
          </p>

          <div style={styles.statsGrid}>
            <div>
              <h4 style={styles.statNum}>100%</h4>
              <p style={styles.statLabel}>Chất liệu cao cấp</p>
            </div>
            <div>
              <h4 style={styles.statNum}>7 NGÀY</h4>
              <p style={styles.statLabel}>Đổi trả linh hoạt</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS Styles (Phong cách tối giản)
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '60px 20px',
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    color: '#111',
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '300',
    letterSpacing: '4px',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '12px',
    letterSpacing: '2px',
    color: '#777',
    margin: 0,
  },
  contentWrapper: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '50px',
    alignItems: 'center',
  },
  imageSection: {
    width: '100%',
  },
  image: {
    width: '100%',
    height: '450px',
    objectFit: 'cover',
  },
  textSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '500',
    letterSpacing: '2px',
  },
  paragraph: {
    fontSize: '14px',
    lineHeight: '1.8',
    color: '#555',
    margin: 0,
  },
  statsGrid: {
    display: 'flex',
    gap: '40px',
    marginTop: '20px',
    borderTop: '1px solid #eee',
    paddingTop: '20px',
  },
  statNum: {
    fontSize: '22px',
    fontWeight: '600',
    margin: '0 0 5px 0',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    margin: 0,
    letterSpacing: '1px',
  }
};

export default About;