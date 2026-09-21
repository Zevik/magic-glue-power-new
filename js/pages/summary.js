export const slug = 'summary';
export const title = 'השמות האמיתיים';

export const sectionClass = 'theme-summary';

export const html = `
<span class="kicker">🏆 שלב 11</span>
<h2 class="title">השמות האמיתיים</h2>
<p class="lead">עברתם מסע מדהים וגיליתם את הסודות הגדולים ביותר של העולם! בואו נגלה לכם את השמות האמיתיים שהמדענים משתמשים בהם:</p>
<div class="facts">
    <div class="card fact" style="--f1: #fde047; --f2: #fb923c;">
        <div class="icon">⚡</div>
        <p>"כוח הדבקסם" הוא בעצם...</p>
        <h3>הכוח האלקטרו-מגנטי</h3>
    </div>
    <div class="card fact" style="--f1: #fca5a5; --f2: #f472b6;">
        <div class="icon">⚛️</div>
        <p>ה"גולות" שלנו הן בעצם...</p>
        <h3>אטומים</h3>
    </div>
    <div class="card fact" style="--f1: #93c5fd; --f2: #67e8f9;">
        <div class="icon">🧪</div>
        <p>ה"צורונים" שלנו הם בעצם...</p>
        <h3>מולקולות</h3>
    </div>
</div>
<p class="lead">עכשיו אתם לא רק יודעים איך העולם עובד, אתם גם יודעים לדבר כמו מדענים אמיתיים! תודה שהצטרפתם למסע!</p>
<div class="actions">
    <a href="#/mysteries" class="btn btn-ghost">חזרה</a>
    <a href="#/start" class="btn btn-big btn-pulse">לשחק שוב!</a>
</div>
`;

export function init(page) {
    // A burst of confetti for finishing the journey
    const pieces = ['🎉', '⭐', '🔵', '🟡', '🔴', '🟣', '🟢', '✨'];
    for (let i = 0; i < 36; i++) {
        const piece = document.createElement('span');
        piece.className = 'confetti';
        piece.textContent = pieces[i % pieces.length];
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.fontSize = `${1.1 + Math.random() * 1.2}rem`;
        piece.style.animationDuration = `${3 + Math.random() * 3}s`;
        piece.style.animationDelay = `${Math.random() * 2}s`;
        page.root.appendChild(piece);
    }
}
