/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

import {
  DocumentSyntax,
  BlockSyntax,
  VersionSyntax,
  ObjectMemberSyntax,
  BasePropertySyntax,
} from "../parsing/syntax-nodes";
import { Token } from "../scanning/tokens";

export enum BoundKind {
  // Top level
  Document,
  Version,
  Workflow,
  Action,

  // Properties
  On,
  Resolves,
  Uses,
  Needs,
  Runs,
  Args,
  Env,
  Secrets,

  // Values
  StringValue,
  ObjectMember,
}

export abstract class BaseBoundNode {
  protected constructor(public readonly kind: BoundKind) {}
}

export class BoundDocument extends BaseBoundNode {
  public constructor(
    public readonly version: BoundVersion | undefined,
    public readonly workflows: ReadonlyArray<BoundWorkflow>,
    public readonly actions: ReadonlyArray<BoundAction>,
    public readonly syntax: DocumentSyntax,
  ) {
    super(BoundKind.Document);
  }
}

export class BoundVersion extends BaseBoundNode {
  public constructor(public readonly version: number, public readonly syntax: VersionSyntax) {
    super(BoundKind.Version);
  }
}

export class BoundWorkflow extends BaseBoundNode {
  public constructor(
    public readonly name: string,
    public readonly on: BoundOn | undefined,
    public readonly resolves: BoundResolves | undefined,
    public readonly syntax: BlockSyntax,
  ) {
    super(BoundKind.Workflow);
  }
}

export class BoundAction extends BaseBoundNode {
  public constructor(
    public readonly name: string,
    public readonly uses: BoundUses | undefined,
    public readonly needs: BoundNeeds | undefined,
    public readonly runs: BoundRuns | undefined,
    public readonly args: BoundArgs | undefined,
    public readonly env: BoundEnv | undefined,
    public readonly secrets: BoundSecrets | undefined,
    public readonly syntax: BlockSyntax,
  ) {
    super(BoundKind.Action);
  }
}

export class BoundOn extends BaseBoundNode {
  public constructor(public readonly event: BoundStringValue | undefined, public readonly syntax: BasePropertySyntax) {
    super(BoundKind.On);
  }
}

export class BoundResolves extends BaseBoundNode {
  public constructor(
    public readonly actions: ReadonlyArray<BoundStringValue>,
    public readonly syntax: BasePropertySyntax,
  ) {
    super(BoundKind.Resolves);
  }
}

export class BoundUses extends BaseBoundNode {
  public constructor(public readonly value: BoundStringValue | undefined, public readonly syntax: BasePropertySyntax) {
    super(BoundKind.Uses);
  }
}

export class BoundNeeds extends BaseBoundNode {
  public constructor(
    public readonly actions: ReadonlyArray<BoundStringValue>,
    public readonly syntax: BasePropertySyntax,
  ) {
    super(BoundKind.Needs);
  }
}

export class BoundRuns extends BaseBoundNode {
  public constructor(
    public readonly commands: ReadonlyArray<BoundStringValue>,
    public readonly syntax: BasePropertySyntax,
  ) {
    super(BoundKind.Runs);
  }
}

export class BoundArgs extends BaseBoundNode {
  public constructor(
    public readonly args: ReadonlyArray<BoundStringValue>,
    public readonly syntax: BasePropertySyntax,
  ) {
    super(BoundKind.Args);
  }
}

export class BoundEnv extends BaseBoundNode {
  public constructor(
    public readonly variables: ReadonlyArray<BoundObjectMember>,
    public readonly syntax: BasePropertySyntax,
  ) {
    super(BoundKind.Env);
  }
}

export class BoundSecrets extends BaseBoundNode {
  public constructor(
    public readonly secrets: ReadonlyArray<BoundStringValue>,
    public readonly syntax: BasePropertySyntax,
  ) {
    super(BoundKind.Secrets);
  }
}

export class BoundStringValue extends BaseBoundNode {
  public constructor(public readonly value: string, public readonly syntax: Token) {
    super(BoundKind.StringValue);
  }
}

export class BoundObjectMember extends BaseBoundNode {
  public constructor(
    public readonly name: string,
    public readonly value: string,
    public readonly syntax: ObjectMemberSyntax,
  ) {
    super(BoundKind.ObjectMember);
  }
}
