const assert = require('assert');
const sinon = require('sinon');

// We'll mock these functions
const { starSlash } = require('../../../src/actions/star-slash.cjs');
const skills = require('../../../src/agent/library/skills.js');
const world = require('../../../src/agent/library/world.js');
const friendComm = require('../../../src/utils/friend-communication.js');

describe('Star Slash Feature', function() {
  let getNearbyEnemiesStub;
  let getNearbyFriendsStub;
  let mainAttackStub;
  let performSupportMoveStub;

  beforeEach(() => {
    getNearbyEnemiesStub = sinon.stub(skills, 'getNearbyEnemies');
    getNearbyFriendsStub = sinon.stub(world, 'getNearbyFriends');
    mainAttackStub = sinon.stub(skills, 'mainAttack').resolves();
    performSupportMoveStub = sinon.stub(friendComm, 'performSupportMove').resolves();
  });

  afterEach(() => {
    getNearbyEnemiesStub.restore();
    getNearbyFriendsStub.restore();
    mainAttackStub.restore();
    performSupportMoveStub.restore();
  });

  it('should return immediately if no enemies are nearby', async () => {
    getNearbyEnemiesStub.returns([]);
    await starSlash({username: 'testBot'});
    assert.ok(mainAttackStub.notCalled, 'mainAttack should not be called when no enemies');
  });

  it('should attack enemies and request friend support if enemies are found', async () => {
    const enemy = { name: 'Zombie' };
    const friend = { username: 'FriendBot' };

    getNearbyEnemiesStub.returns([enemy]);
    getNearbyFriendsStub.returns([friend]);

    await starSlash({username: 'testBot'});

    assert.ok(mainAttackStub.calledOnce, 'mainAttack should be called once');
    assert.ok(performSupportMoveStub.calledOnce, 'performSupportMove should be called once');
  });
});
