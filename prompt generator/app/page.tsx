const navItems = [
  { label: "소개", href: "#about" },
  { label: "우리가 하는 일", href: "#work" },
  { label: "팀원", href: "#team" },
  { label: "성과", href: "#metrics" },
  { label: "문의", href: "#contact" },
];

const highlights = [
  "전사 AX 전환",
  "생성형 AI 확산",
  "업무 자동화",
  "데이터 거버넌스",
];

const workItems = [
  {
    title: "AX 전략 수립",
    description: "중장기 AI 전환 로드맵과 실행 전략을 설계합니다.",
    badge: "01",
  },
  {
    title: "생성형 AI 확산",
    description: "연구와 행정 업무에 생성형 AI를 활용할 수 있는 기반을 만듭니다.",
    badge: "02",
  },
  {
    title: "AI 업무혁신",
    description: "반복 업무를 자동화하고 AI Agent 도입을 지원합니다.",
    badge: "03",
  },
  {
    title: "데이터 거버넌스",
    description: "데이터 표준화와 품질 관리 체계를 정비합니다.",
    badge: "04",
  },
  {
    title: "AX 교육",
    description: "AI 활용 교육과 변화관리를 통해 조직 역량을 높입니다.",
    badge: "05",
  },
];

const teamMembers = [
  {
    name: "한도윤",
    role: "팀장 / AX 전략 총괄",
    duty: "AX 비전 및 전략 수립, 대외 협력",
    quote: "AI는 기술이 아니라 업무 방식의 변화입니다.",
  },
  {
    name: "윤서아",
    role: "AI 플랫폼 리드",
    duty: "생성형 AI 플랫폼 구축 및 운영",
    quote: "좋은 플랫폼은 누구나 쉽게 사용할 수 있어야 합니다.",
  },
  {
    name: "강민호",
    role: "AI 솔루션 아키텍트",
    duty: "Agent 시스템 및 업무 자동화 설계",
    quote: "자동화는 사람의 시간을 돌려주는 기술입니다.",
  },
  {
    name: "오지은",
    role: "데이터 전략 전문가",
    duty: "데이터 품질 및 거버넌스 체계 설계",
    quote: "신뢰할 수 있는 데이터가 좋은 AI를 만듭니다.",
  },
  {
    name: "최현우",
    role: "AX 혁신 컨설턴트",
    duty: "현업 과제 발굴 및 변화관리 지원",
    quote: "현장의 문제에서 혁신이 시작됩니다.",
  },
];

const metrics = [
  { value: "50+", label: "연간 AX 혁신 과제 추진" },
  { value: "20+", label: "생성형 AI 서비스 기획" },
  { value: "5", label: "AX 전문가" },
  { value: "30%", label: "업무 생산성 향상 목표" },
];

export default function HomePage() {
  return (
    <main className="page">
      <div className="background background-top" />
      <div className="background background-bottom" />

      <header className="topbar">
        <a className="brand" href="#top" aria-label="ETRI AX전략팀 홈으로 이동">
          <span className="brandMark">AX</span>
          <span>
            <strong>ETRI AX전략팀</strong>
            <small>전사 AX 전환을 이끄는 전략 조직</small>
          </span>
        </a>

        <nav className="nav" aria-label="섹션 이동">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a className="button button-small" href="#contact">
          협업 문의
        </a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">ETRI AX전략팀</p>
          <h1>기술을 전략으로, 전략을 실행으로.</h1>
          <p className="lede">
            ETRI의 전사 AX 전환을 설계하고, 현장의 변화를 함께 만드는 AX전략팀입니다.
            생성형 AI, 데이터, 자동화, 거버넌스를 연결해 연구원 전반의 업무 혁신을 지원합니다.
          </p>

          <div className="hero-actions">
            <a className="button" href="#work">
              우리가 하는 일
            </a>
            <a className="button button-ghost" href="#contact">
              문의하기
            </a>
          </div>

          <div className="chip-row" aria-label="핵심 키워드">
            {highlights.map((item) => (
              <span key={item} className="chip">
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside className="hero-panel" aria-label="팀 소개 요약">
          <div className="panel-card">
            <span className="panel-label">핵심 가치</span>
            <strong>전사 AX 전환의 실행 허브</strong>
            <p>
              단순한 도구 도입이 아니라 업무 방식 전체를 바꾸는 전략과 실행을 함께 만듭니다.
            </p>
          </div>
          <div className="panel-grid">
            <div className="mini-card">
              <span>전략</span>
              <strong>로드맵</strong>
            </div>
            <div className="mini-card">
              <span>확산</span>
              <strong>생성형 AI</strong>
            </div>
            <div className="mini-card">
              <span>혁신</span>
              <strong>자동화</strong>
            </div>
            <div className="mini-card">
              <span>기반</span>
              <strong>데이터</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="section" id="about">
        <div className="section-head">
          <p className="eyebrow">팀 소개</p>
          <h2>AX전환을 설계하고 실행하는 팀</h2>
          <p>
            AX전략팀은 연구개발과 경영 전반의 AI 전환을 지원하는 전략 조직입니다. 전사적인
            AX 확산을 통해 더 빠르고, 더 정확하고, 더 효율적인 일하는 방식을 만들어갑니다.
          </p>
        </div>

        <div className="about-grid">
          <article className="about-card">
            <h3>우리가 지향하는 것</h3>
            <p>
              AI는 새로운 도구를 하나 더 얹는 일이 아니라, 조직의 업무 구조를 다시 설계하는
              일입니다. AX전략팀은 그 변화를 현실적인 실행 과제로 바꾸는 역할을 맡습니다.
            </p>
          </article>
          <article className="about-card accent">
            <h3>우리가 연결하는 것</h3>
            <p>
              생성형 AI, 데이터, 자동화, 교육, 거버넌스를 서로 연결해 현업이 실제로 체감할 수
              있는 혁신을 만들어갑니다.
            </p>
          </article>
        </div>
      </section>

      <section className="section" id="work">
        <div className="section-head narrow">
          <p className="eyebrow">우리가 하는 일</p>
          <h2>전사 AX 전환을 위한 5가지 핵심 영역</h2>
          <p>
            전략 수립부터 교육, 자동화, 데이터 거버넌스까지 폭넓게 지원하며 조직의 AX 역량을
            높입니다.
          </p>
        </div>

        <div className="card-grid">
          {workItems.map((item) => (
            <article key={item.title} className="work-card">
              <span className="card-badge">{item.badge}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="team">
        <div className="section-head narrow">
          <p className="eyebrow">팀원 소개</p>
          <h2>AX전환을 함께 만드는 사람들</h2>
          <p>
            각자의 전문성을 바탕으로 전략, 플랫폼, 자동화, 데이터, 변화관리를 함께 수행합니다.
          </p>
        </div>

        <div className="team-grid">
          {teamMembers.map((member) => (
            <article key={member.name} className="team-card">
              <div className="avatar" aria-hidden="true">
                {member.name.slice(0, 1)}
              </div>
              <div>
                <h3>{member.name}</h3>
                <p className="role">{member.role}</p>
                <p className="duty">{member.duty}</p>
              </div>
              <blockquote>{member.quote}</blockquote>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="metrics">
        <div className="section-head narrow">
          <p className="eyebrow">성과</p>
          <h2>숫자로 보는 AX전략팀</h2>
          <p>우리는 계획에 그치지 않고, 실제 변화를 만드는 것을 목표로 합니다.</p>
        </div>

        <div className="metric-grid">
          {metrics.map((metric) => (
            <article key={metric.label} className="metric-card">
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section contact" id="contact">
        <div className="section-head narrow">
          <p className="eyebrow">문의하기</p>
          <h2>함께 AX를 만들어가요</h2>
          <p>
            AX 전환 아이디어, 협업 제안, 교육 요청이 있다면 언제든지 연락해 주세요. 현업의 문제를
            함께 정의하고 실행 가능한 해법을 찾겠습니다.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-card">
            <span>이메일</span>
            <strong>ax.strategy@etri.example</strong>
          </div>
          <div className="contact-card">
            <span>내선</span>
            <strong>042-000-1234</strong>
          </div>
          <div className="contact-card">
            <span>운영시간</span>
            <strong>평일 09:00~18:00</strong>
          </div>
        </div>

        <div className="contact-actions">
          <a className="button" href="mailto:ax.strategy@etri.example">
            협업 문의 보내기
          </a>
          <a className="button button-ghost" href="mailto:ax.strategy@etri.example?subject=AX%20과제%20제안">
            AX 과제 제안하기
          </a>
        </div>
      </section>

      <footer className="footer">
        <p>ETRI AX전략팀</p>
        <span>기술을 전략으로, 전략을 실행으로.</span>
      </footer>
    </main>
  );
}
