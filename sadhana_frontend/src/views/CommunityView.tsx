import React from 'react';
import { Link } from 'react-router-dom';
import { GameNavigationHeader } from '../components/GameNavigationHeader';

export const CommunityView: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#24170f] text-[#352419]">
      <GameNavigationHeader />

      <main className="page-wrap">
        <div className="page-heading">
          <div>
            <div className="eyebrow">Train together · Grow together</div>
            <h1 className="page-title">Community Camp</h1>
            <p className="page-subtitle">
              A place for future clans, trainer-led courses, shared milestones and social progress
              cards.
            </p>
          </div>
          <span className="pill">Community preview</span>
        </div>

        {/* Community Camp Grid */}
        <div className="community-grid">
          <article className="community-card">
            <div className="big">🏕️</div>
            <h2 style={{ margin: '8px 0 4px', fontSize: '20px' }}>Clans</h2>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#7b6245' }}>
              Join a group with a shared training goal, support each other's consistency and
              celebrate meaningful milestones.
            </p>
            <span className="pill">Coming soon</span>
          </article>

          <article className="community-card">
            <div className="big">📜</div>
            <h2 style={{ margin: '8px 0 4px', fontSize: '20px' }}>Trainer Courses</h2>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#7b6245' }}>
              Follow structured courses prepared by trainers, while your daily session still adapts
              to your current context.
            </p>
            <span className="pill">Coming soon</span>
          </article>

          <article className="community-card">
            <div className="big">🏆</div>
            <h2 style={{ margin: '8px 0 4px', fontSize: '20px' }}>Share Your Journey</h2>
            <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#7b6245' }}>
              Create a share card for your class, level, completed session or personal
              milestone—based on real progress.
            </p>
            <span className="pill">Coming soon</span>
          </article>
        </div>

        {/* Community Principles */}
        <section className="wood-panel" style={{ marginTop: '14px' }}>
          <div className="panel-inner">
            <div className="panel-head">
              <h2>Community Principles</h2>
              <small>What Sādhanā stands for</small>
            </div>
            <div className="two-col">
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: '17px' }}>Compete with yesterday</h3>
                <p className="muted" style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
                  Rewards should encourage real training behaviour—not reward easy-workout farming
                  or shame people for taking needed recovery.
                </p>
              </div>
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: '17px' }}>Progress at your pace</h3>
                <p className="muted" style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>
                  Class identity provides direction, while safe progression and personal
                  circumstances guide each actual workout.
                </p>
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <Link to="/today" className="rpg-btn">
                Return to your quests →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        SĀDHANĀ · Adapt to the person. Challenge the person. Develop the person.
      </footer>
    </div>
  );
};

export default CommunityView;
