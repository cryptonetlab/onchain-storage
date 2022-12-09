<template>
  <div class="landing">
    <Navbar />
    <div class="container mt-5 mb-5">
      <div class="row justify-content-center">
        <div class="col-12 col-md-12 col-lg-9">
          <h4>Privacy Policy</h4>
          <!-- <div class="mt-5 mb-5" style="text-align: justify">
            <p>
              onchain.storage an ecosystem of composable protocols to store data
              via one blockchain interaction.
            </p>
            <p class="mt-4">
              By accessing or using the Services in any way, including without
              limitation by visiting the Website, and/or connecting your Wallet
              to the Services, you represent that you have read, understand, and
              agree to be bound by these Terms of Use(1). IF YOU DO NOT AGREE TO
              BE BOUND BY THE TERMS OF USE, YOU MAY NOT ACCESS OR USE THE
              SERVICES.
            </p>
            <p class="mt-4">
              (1) Protocols:<br />
              <a href="https://retriev.org" target="_blank"><b>Retriev</b></a
              ><br />
              <a href="http://https://web3bounty.app/#/"><b>Web3Bounty</b></a>
            </p>
          </div> -->
          <div class="mt-5 mb-5" style="text-align: justify">
            <p class="mt-4">
              <b>Retriev privacy policy</b><br /><br />
              This Privacy Policy governs all use of the retriev.org website
              (the “Website”) and all content, services and products available
              at or through the Website (collectively, the “Services”). The
              Services are offered subject to your acceptance without
              modification of all the terms and conditions herein, and all other
              other operating rules, policies (including, without limitation,
              our "Terms of Service") and procedures that may be updated from
              time to time. By accessing or using any part of our Services you
              agree to be bound by the terms and conditions of the Privacy
              Policy. If you do not agree to all of the terms and conditions of
              this Privacy Policy, then you may not access our Services.
            </p>

            <p class="mt-4">
              <b>What information do we collect?</b><br />
              We currently do not collect personal information from the users of
              our Services or our Website. We are a conduit for information
              controlled by others. It is our users who are responsible for the
              user-uploaded and/or community-hosted content transmitted across
              our network (e.g., images, written content, graphics, etc.).
            </p>

            <p class="mt-4">
              <b>Third party links</b><br />
              Occasionally, at our discretion, we may include or offer third
              party products or services on our site. These third party sites
              have separate and independent privacy policies and may collect or
              use your data in a way we are not aware of. We therefore have no
              responsibility or liability for the content and activities of
              these linked sites.
            </p>

            <p class="mt-4">
              <b>Changes to our Privacy Policy</b> <br />If we decide to change
              our Privacy Policy, we will post those changes on this page. This
              document is CC-BY-SA. It was last updated October 21, 2022.
            </p>
          </div>
          <hr />
          <div class="mt-5 mb-5" style="text-align: justify">
            <p>
              <b>Web3 Bounty privacy policy</b><br />
              <br />This Privacy Policy governs all use of the web3bounty.app
              website (the “Website”) and all content, services and products
              available at or through the Website (collectively, the
              “Services”).<br /><br />
              The Services are offered subject to your acceptance without
              modification of all the terms and conditions herein, and all other
              other operating rules, policies (including, without limitation,
              our "Terms of Service") and procedures that may be updated from
              time to time. By accessing or using any part of our Services you
              agree to be bound by the terms and conditions of the Privacy
              Policy. If you do not agree to all of the terms and conditions of
              this Privacy Policy, then you may not access our Services.
            </p>

            <p class="mt-4">
              <b>What information do we collect?</b><br />
              We currently do not collect personal information from the users of
              our Services or our Website. We are a conduit for information
              controlled by others. It is our users who are responsible for the
              user-uploaded and/or community-hosted content transmitted across
              our network (e.g., images, written content, graphics, etc.).
            </p>

            <p class="mt-4">
              <b>Third party links</b><br />
              Occasionally, at our discretion, we may include or offer third
              party products or services on our site. These third party sites
              have separate and independent privacy policies and may collect or
              use your data in a way we are not aware of. We therefore have no
              responsibility or liability for the content and activities of
              these linked sites.
            </p>

            <p class="mt-4">
              <b>Changes to our Privacy Policy</b> <br />If we decide to change
              our Privacy Policy, we will post those changes on this page. This
              document is CC-BY-SA. It was last updated October 21, 2022.
            </p>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import Navbar from "@/components/landing/Navbar.vue";
import Footer from "@/components/landing/Footer.vue";
import checkViewport from "../mixins/checkViewport";

export default {
  name: "privacy",
  mixins: [checkViewport],
  components: {
    Footer,
    Navbar,
  },
  data() {
    return {};
  },
};
</script>
