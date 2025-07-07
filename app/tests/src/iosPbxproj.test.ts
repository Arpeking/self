// SPDX-License-Identifier: BUSL-1.1; Copyright (c) 2025 Social Connect Labs, Inc.; Licensed under BUSL-1.1 (see LICENSE); Apache-2.0 from 2029-06-11

/**
 * @jest-environment node
 */

import * as fs from 'fs';
import * as path from 'path';

describe('iOS project.pbxproj Configuration', () => {
  const projectPath = path.join(
    __dirname,
    '../../ios/Self.xcodeproj/project.pbxproj',
  );
  let projectContent: string;

  beforeAll(() => {
    try {
      projectContent = fs.readFileSync(projectPath, 'utf8');
    } catch (error) {
      throw new Error(
        `Failed to read iOS project file at ${projectPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });

  it('uses the correct bundle identifier', () => {
    expect(projectContent).toMatch(
      /PRODUCT_BUNDLE_IDENTIFIER\s*=\s*com\.warroom\.proofofpassport;/,
    );
  });

  it('has the expected development team set', () => {
    expect(projectContent).toMatch(/DEVELOPMENT_TEAM\s*=\s*5B29R5LYHQ;/);
  });

  it('includes GoogleService-Info.plist in resources', () => {
    expect(projectContent).toContain('GoogleService-Info.plist in Resources');
  });
});
