require "rails_helper"

# == Schema Information
#
# Table name: events
#
#  id           :bigint           not null, primary key
#  description  :text
#  name         :string           not null
#  public_token :string           not null
#  time_zone    :string           not null
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#
# Indexes
#
#  index_events_on_public_token  (public_token) UNIQUE
#
RSpec.describe Event, type: :model do
  describe "validations" do
    it "requires between one and ten time options" do
      event = build(:event, with_time_option: false)

      expect(event).not_to be_valid
      expect(event.errors[:time_options]).to include("must contain between 1 and 10 options")

      event.time_options = 10.times.map { |index| build(:time_option, starts_at: (index + 1).days.from_now) }
      expect(event).to be_valid

      event.time_options << build(:time_option, starts_at: 11.days.from_now)
      expect(event).not_to be_valid
    end

    it "validates the time zone identifier" do
      event = build(:event, time_options: [ build(:time_option) ], time_zone: "Invalid/Timezone")

      expect(event).not_to be_valid
      expect(event.errors[:time_zone]).to include("is invalid")
    end
  end

  describe "public token" do
    it "generates a prototype-length URL-safe token" do
      event = create(:event)

      expect(event.public_token).to match(/\A[A-Za-z0-9_-]{43}\z/)
    end
  end

  describe "password" do
    it "allows an optional password" do
      expect(build(:event, password: nil, allow_passwordless_management: true)).to be_valid
      expect(build(:event, password: "safe-password")).to be_valid
    end

    it "requires consent for passwordless event management" do
      event = build(:event, password: nil, allow_passwordless_management: false)

      expect(event).not_to be_valid
      expect(event.errors[:allow_passwordless_management]).to include("must be accepted when no password is set")
    end

    it "requires at least four characters when set" do
      event = build(:event, password: "abc")

      expect(event).not_to be_valid
      expect(event.errors[:password]).to include("must be at least 4 characters")
    end

    it "limits passwords to 48 characters" do
      event = build(:event, password: "a" * 49)

      expect(event).not_to be_valid
      expect(event.errors[:password]).to include("must be at most 48 characters")
    end

    it "rejects whitespace and control characters" do
      event = build(:event, password: "safe password")

      expect(event).not_to be_valid
      expect(event.errors[:password]).to include("must not contain whitespace or control characters")
    end

    it "stores only a digest" do
      event = create(:event, password: "safe-password")

      expect(event.password_digest).to be_present
      expect(event.password_digest).not_to eq("safe-password")
      expect(event.authenticate("safe-password")).to eq(event)
    end
  end
end
