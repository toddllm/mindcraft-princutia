// File: src/tests/unit/test_star_slash.js
import { strict as assert } from 'node:assert';
import sinon from 'sinon';

import { starSlash } from '../../../src/actions/star-slash.js';
import * as skills from '../../../src/agent/library/skills.js';
import * as world from '../../../src/agent/library/world.js';
import * as friendComm from '../../../src/utils/friend-communication.js';

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
    sinon.restore();
  });

  it('should run a basic test', async () => {
    assert.ok(true);
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
