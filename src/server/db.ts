import { Sequelize, DataTypes, Model } from "sequelize";

// Use external DB if running on Railway, else fallback to local sqlite for development
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "mysql",
      logging: false,
    })
  : new Sequelize({
      dialect: "sqlite",
      storage: "./data.sqlite",
      logging: false,
    });

// Models definitions
export class User extends Model {
  public id!: number;
  public username!: string;
  public password!: string;
}

User.init(
  {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize, modelName: "User" },
);

export class Settings extends Model {
  public key!: string;
  public value!: string;
}

Settings.init(
  {
    key: { type: DataTypes.STRING, primaryKey: true },
    value: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, modelName: "Settings" },
);

export class Campaign extends Model {
  public id!: number;
  public name!: string;
  public message!: string;
  public status!: "PENDING" | "SENDING" | "COMPLETED" | "PAUSED";
  public scheduledTime!: Date | null;
}

Campaign.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    message: { type: DataTypes.TEXT, allowNull: false },
    status: {
      type: DataTypes.ENUM("PENDING", "SENDING", "COMPLETED", "PAUSED"),
      defaultValue: "PENDING",
    },
    scheduledTime: { type: DataTypes.DATE, allowNull: true },
  },
  { sequelize, modelName: "Campaign" },
);

export class Contact extends Model {
  public id!: number;
  public phone!: string;
  public name!: string;
  public campaignId!: number;
  public status!: "PENDING" | "SENT" | "FAILED" | "DELIVERED" | "UNDELIVERED";
  public messageCount!: number;
  public beemRequestId!: string | null;
}

Contact.init(
  {
    phone: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "SENT",
        "FAILED",
        "DELIVERED",
        "UNDELIVERED",
      ),
      defaultValue: "PENDING",
    },
    messageCount: { type: DataTypes.INTEGER, defaultValue: 1 },
    beemRequestId: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: "Contact" },
);

Campaign.hasMany(Contact, { foreignKey: "campaignId" });
Contact.belongsTo(Campaign, { foreignKey: "campaignId" });

export async function checkDbConnection() {
  try {
    await sequelize.authenticate();
    return true;
  } catch (err) {
    return false;
  }
}

export { sequelize };
